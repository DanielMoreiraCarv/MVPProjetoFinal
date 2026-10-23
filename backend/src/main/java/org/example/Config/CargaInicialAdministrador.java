package org.example.Config;

import org.example.Models.Papel;
import org.example.Models.Request.PapelConcedidoRequest;
import org.example.Repositories.UsuarioRepository;
import org.example.Services.UsuarioService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * O primeiro administrador. Sem ele ninguém poderia dar papel a ninguém: o
 * cadastro aberto só cria PUBLICO, e só ADMINISTRADOR concede papéis.
 *
 * Vem do ambiente (ADMIN_EMAIL, ADMIN_SENHA, ADMIN_NOME). Idempotente: se o
 * e-mail já existe, nada muda — nem a senha, para que trocá-la pela API não
 * seja desfeito no próximo boot.
 */
@Component
public class CargaInicialAdministrador implements ApplicationRunner
{
    private static final Logger LOG = LoggerFactory.getLogger(CargaInicialAdministrador.class);

    private final UsuarioRepository usuarioRepository;
    private final UsuarioService usuarioService;

    @Value("${auth.admin.email:}")
    private String email;

    @Value("${auth.admin.senha:}")
    private String senha;

    @Value("${auth.admin.nome:Administrador}")
    private String nome;

    public CargaInicialAdministrador ( UsuarioRepository usuarioRepository, UsuarioService usuarioService )
    {
        this.usuarioRepository = usuarioRepository;
        this.usuarioService = usuarioService;
    }

    @Override
    public void run ( ApplicationArguments args )
    {
        if ( email.isBlank() || senha.isBlank() )
        {
            return;
        }

        if ( usuarioRepository.existsByEmailIgnoreCase( email.trim() ) )
        {
            return;
        }

        usuarioService.novo( nome, email, senha, List.of( new PapelConcedidoRequest( Papel.ADMINISTRADOR, null ) ) );
        LOG.info( "administrador inicial criado: {}", email.trim() );
    }
}
