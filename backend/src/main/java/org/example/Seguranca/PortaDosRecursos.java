package org.example.Seguranca;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.example.Seguranca.Acesso.Recurso;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.HandlerMapping;

import java.util.Map;

/**
 * Confere os ids do caminho e da query antes do controller: `/partida/{id}`,
 * `/competicao/{id}/equipe/{idEquipe}`, `?idArbitro=`. Rota sem dono — a
 * tabela antiga — só para a plataforma.
 */
@Component
public class PortaDosRecursos implements HandlerInterceptor
{
    private final Acesso acesso;

    public PortaDosRecursos(Acesso acesso)
    {
        this.acesso = acesso;
    }

    @Override
    public boolean preHandle(HttpServletRequest requisicao, HttpServletResponse resposta, Object handler)
    {
        String caminho = requisicao.getRequestURI();
        if (!MapaDaPorta.aplica(caminho) || acesso.irrestrito())
        {
            return true;
        }

        if (MapaDaPorta.recursoDoTrecho(caminho).orElse(null) == Recurso.SO_PLATAFORMA)
        {
            acesso.exigir(Recurso.SO_PLATAFORMA, 0L);
        }

        @SuppressWarnings("unchecked")
        Map<String, String> variaveis = (Map<String, String>)
                requisicao.getAttribute(HandlerMapping.URI_TEMPLATE_VARIABLES_ATTRIBUTE);
        if (variaveis != null)
        {
            variaveis.forEach((nome, valor) -> conferir(nome, valor, caminho));
        }

        requisicao.getParameterMap().forEach((nome, valores) -> {
            if (MapaDaPorta.pareceId(nome))
            {
                for (String valor : valores)
                {
                    conferir(nome, valor, caminho);
                }
            }
        });

        return true;
    }

    private void conferir(String nome, String valor, String caminho)
    {
        Long id;
        try
        {
            id = Long.valueOf(valor);
        }
        catch (NumberFormatException naoNumerico)
        {
            // A conversão do Spring recusa com 400 logo depois; não há o que conferir.
            return;
        }

        MapaDaPorta.recursoDe(nome, caminho).ifPresent(recurso -> acesso.exigir(recurso, id));
    }
}
