package org.example.Config;

import org.example.Seguranca.PortaDosRecursos;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class ConfiguracaoDaPorta implements WebMvcConfigurer
{
    private final PortaDosRecursos porta;

    public ConfiguracaoDaPorta(PortaDosRecursos porta)
    {
        this.porta = porta;
    }

    @Override
    public void addInterceptors(InterceptorRegistry registro)
    {
        registro.addInterceptor(porta).addPathPatterns("/api/v1/**");
    }
}
