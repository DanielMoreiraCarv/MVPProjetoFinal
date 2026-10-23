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
 * As rotas que já existiam continuam abertas por padrão, porque o front ainda
 * não tem tela de login e fechá-las agora o deixaria sem funcionar. Com
 * AUTH_EXIGIR_LOGIN=true a leitura (GET) continua pública e toda escrita passa
 * a exigir login. As rotas de usuário exigem ADMINISTRADOR desde já.
 */
@Configuration
public class ConfiguracaoDeSeguranca
{
    @Value("${auth.exigir-login:false}")
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
                        rotas.requestMatchers(HttpMethod.GET, "/api/**").permitAll();
                        rotas.anyRequest().authenticated();
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
