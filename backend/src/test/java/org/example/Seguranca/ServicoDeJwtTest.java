package org.example.Seguranca;

import org.example.Models.Papel;
import org.example.Models.Usuario;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

/** O token sem Spring nem banco: só a assinatura e o conteúdo. */
class ServicoDeJwtTest
{
    private static final String SEGREDO = "um-segredo-de-teste-com-mais-de-32-bytes!";

    @Test
    void tokenEmitidoEhConferidoComOsPapeis()
    {
        ServicoDeJwt servico = new ServicoDeJwt(SEGREDO, 15);

        var claims = servico.conferir(servico.emitir(usuario()).token()).orElseThrow();

        assertEquals("7", claims.getSubject());
        assertEquals("ana@exemplo.com", claims.get("email"));
        assertEquals(java.util.List.of("ORGANIZADOR"), claims.get("papeis"));
    }

    @Test
    void tokenDeOutroSegredoEhRecusado()
    {
        String token = new ServicoDeJwt(SEGREDO, 15).emitir(usuario()).token();

        assertTrue(new ServicoDeJwt("outro-segredo-tambem-com-mais-de-32-bytes", 15)
                .conferir(token).isEmpty());
    }

    @Test
    void tokenAdulteradoOuVencidoEhRecusado()
    {
        ServicoDeJwt servico = new ServicoDeJwt(SEGREDO, 15);
        String token = servico.emitir(usuario()).token();

        assertTrue(servico.conferir(token.substring(0, token.length() - 2) + "xx").isEmpty());
        assertTrue(servico.conferir("lixo").isEmpty());

        ServicoDeJwt vencido = new ServicoDeJwt(SEGREDO, -1);
        assertTrue(vencido.conferir(vencido.emitir(usuario()).token()).isEmpty());
    }

    @Test
    void segredoCurtoDerrubaOBoot()
    {
        assertThrows(IllegalStateException.class, () -> new ServicoDeJwt("curto", 15));
    }

    private static Usuario usuario()
    {
        Papel organizador = new Papel();
        organizador.setCodigo("ORGANIZADOR");

        Usuario usuario = new Usuario();
        usuario.setId(7L);
        usuario.setEmail("ana@exemplo.com");
        usuario.conceder(organizador, null);
        return usuario;
    }
}
