package org.example;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.servlet.UserDetailsServiceAutoConfiguration;

// Sem o usuário em memória que o Spring Security cria por padrão (com senha
// impressa no log): quem autentica é o filtro de JWT, contra a tabela usuario.
@SpringBootApplication(exclude = UserDetailsServiceAutoConfiguration.class)
public class ProjetoFinalIntegradorApplication {

    public static void main(String[] args) {
        SpringApplication.run(
                ProjetoFinalIntegradorApplication.class,
                args
        );
    }
}