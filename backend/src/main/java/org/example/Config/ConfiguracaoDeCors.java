package org.example.Config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * CORS num lugar só.
 *
 * Estava como `@CrossOrigin(origins = "*")` repetido em dez controllers.
 * Aceitável enquanto não há autenticação, inaceitável depois: com token em
 * cabeçalho, origem aberta é o que permite a qualquer site autenticado no
 * navegador falar com a API em nome de quem está logado (RNF24, RNF26).
 *
 * As origens vêm do ambiente. O padrão é o front do pod local; em produção a
 * variável recebe o domínio do Vercel.
 */
@Configuration
public class ConfiguracaoDeCors implements WebMvcConfigurer
{
    @Value("${CORS_ORIGENS:http://localhost:3000}")
    private String origens;

    @Override
    public void addCorsMappings(CorsRegistry registro)
    {
        registro.addMapping("/api/**")
                .allowedOriginPatterns(origens.split("\\s*,\\s*"))
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }
}
