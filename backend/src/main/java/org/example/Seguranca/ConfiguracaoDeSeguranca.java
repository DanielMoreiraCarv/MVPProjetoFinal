package org.example.Seguranca;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletResponse;
import org.example.Models.Papel;
import org.example.Models.Response.ErroResponse;
import org.example.Repositories.UsuarioRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import java.io.IOException;

/**
 * Quem pode chamar o quê.
 *
 * Sem sessão de servidor e sem cookie: a identidade chega em cada requisição,
 * no JWT do cabeçalho. Por isso CSRF fica desligado — o ataque depende do
 * navegador anexar a credencial sozinho, e cabeçalho ele não anexa.
 *
 * Sem login, só o acompanhamento (`/publico/**`, que o servidor limita às
 * competições abertas) e as rotas de entrar. Todo o resto é da gestão, e
 * estar logado não basta: o cadastro aberto dá o papel PUBLICO, e sem exigir
 * papel qualquer conta criada na hora editaria competições.
 *
 * - leitura da gestão: quem trabalha na competição, inclusive mesa e árbitro;
 * - súmula: os mesmos, porque é a mesa quem a preenche;
 * - o resto da escrita: administração e organização;
 * - usuários e papéis: só administração.
 *
 * AUTH_EXIGIR_LOGIN=false volta a abrir tudo — serve para diagnóstico local,
 * nunca para produção.
 */
@Configuration
public class ConfiguracaoDeSeguranca
{
    private static final String[] PAPEIS_DA_GESTAO = {
            Papel.ADMINISTRADOR, Papel.ORGANIZADOR, Papel.MESARIO, Papel.ARBITRO };

    @Value("${auth.exigir-login:true}")
    private boolean exigirLogin;

    @Bean
    public PasswordEncoder codificadorDeSenha()
    {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain cadeiaDeSeguranca(HttpSecurity http,
                                                 ServicoDeJwt servicoDeJwt,
                                                 UsuarioRepository usuarioRepository,
                                                 ObjectMapper objectMapper) throws Exception
    {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(Customizer.withDefaults())
                .httpBasic(AbstractHttpConfigurer::disable)
                .formLogin(AbstractHttpConfigurer::disable)
                .logout(AbstractHttpConfigurer::disable)
                .sessionManagement(sessao -> sessao.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(rotas -> {
                    rotas.requestMatchers(HttpMethod.OPTIONS, "/**").permitAll();
                    rotas.requestMatchers("/error").permitAll();
                    rotas.requestMatchers(HttpMethod.GET, "/api/v1/publico/**").permitAll();
                    rotas.requestMatchers(HttpMethod.POST,
                            "/api/v1/auth/login",
                            "/api/v1/auth/cadastro",
                            "/api/v1/auth/renovar",
                            "/api/v1/auth/sair").permitAll();
                    rotas.requestMatchers("/api/v1/auth/**").authenticated();
                    rotas.requestMatchers("/api/v1/usuario/**", "/api/v1/papel/**")
                            .hasRole(Papel.ADMINISTRADOR);

                    if (exigirLogin)
                    {
                        rotas.requestMatchers(HttpMethod.GET, "/api/**").hasAnyRole(PAPEIS_DA_GESTAO);
                        rotas.requestMatchers("/api/v1/sumula/**").hasAnyRole(PAPEIS_DA_GESTAO);
                        rotas.anyRequest().hasAnyRole(Papel.ADMINISTRADOR, Papel.ORGANIZADOR);
                    }
                    else
                    {
                        rotas.anyRequest().permitAll();
                    }
                })
                .exceptionHandling(falha -> falha
                        .authenticationEntryPoint((requisicao, resposta, excecao) ->
                                escrever(resposta, objectMapper, HttpStatus.UNAUTHORIZED, ErroResponse.de(
                                        "NAO_AUTENTICADO",
                                        "É preciso entrar na plataforma para fazer isto.")))
                        .accessDeniedHandler((requisicao, resposta, excecao) ->
                                escrever(resposta, objectMapper, HttpStatus.FORBIDDEN, ErroResponse.de(
                                        "ACESSO_NEGADO",
                                        "Seu usuário não tem permissão para fazer isto."))))
                .addFilterBefore(new FiltroDeJwt(servicoDeJwt, usuarioRepository),
                        UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    /** O 401 e o 403 seguem o mesmo contrato de erro do resto da API. */
    private static void escrever(HttpServletResponse resposta, ObjectMapper objectMapper,
                                 HttpStatus status, ErroResponse corpo) throws IOException
    {
        resposta.setStatus(status.value());
        resposta.setContentType(MediaType.APPLICATION_JSON_VALUE);
        resposta.setCharacterEncoding("UTF-8");
        objectMapper.writeValue(resposta.getOutputStream(), corpo);
    }
}
