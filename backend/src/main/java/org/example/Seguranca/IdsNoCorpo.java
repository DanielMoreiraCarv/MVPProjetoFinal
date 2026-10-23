package org.example.Seguranca;

import org.springframework.core.MethodParameter;
import org.springframework.http.HttpInputMessage;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import org.springframework.web.servlet.mvc.method.annotation.RequestBodyAdviceAdapter;

import java.lang.reflect.Field;
import java.lang.reflect.Modifier;
import java.lang.reflect.RecordComponent;
import java.lang.reflect.Type;
import java.util.Collection;

/**
 * Confere os ids que chegam no corpo: `{"idCompeticao": 7}` numa partida
 * nova, `equipesIds` na competição — e o `id` dos PUT, que alguns serviços
 * usam no lugar do id do caminho. Sem isto, `PUT /competicao/1` com
 * `{"id": 7}` editaria a 7.
 */
@ControllerAdvice
public class IdsNoCorpo extends RequestBodyAdviceAdapter
{
    private final Acesso acesso;

    public IdsNoCorpo(Acesso acesso)
    {
        this.acesso = acesso;
    }

    @Override
    public boolean supports(MethodParameter parametro, Type tipo, Class<? extends HttpMessageConverter<?>> conversor)
    {
        return true;
    }

    @Override
    public Object afterBodyRead(Object corpo, HttpInputMessage mensagem, MethodParameter parametro, Type tipo,
                                Class<? extends HttpMessageConverter<?>> conversor)
    {
        String caminho = caminhoAtual();
        if (corpo == null || caminho == null || !MapaDaPorta.aplica(caminho) || acesso.irrestrito())
        {
            return corpo;
        }

        if (corpo.getClass().isRecord())
        {
            for (RecordComponent componente : corpo.getClass().getRecordComponents())
            {
                conferir(componente.getName(), ler(componente, corpo), caminho);
            }
        }
        else
        {
            for (Field campo : corpo.getClass().getDeclaredFields())
            {
                if (!Modifier.isStatic(campo.getModifiers()))
                {
                    conferir(campo.getName(), ler(campo, corpo), caminho);
                }
            }
        }

        return corpo;
    }

    private void conferir(String nome, Object valor, String caminho)
    {
        if (valor == null || !MapaDaPorta.pareceId(nome))
        {
            return;
        }

        MapaDaPorta.recursoDe(nome, caminho).ifPresent(recurso -> {
            if (valor instanceof Number numero)
            {
                acesso.exigir(recurso, numero.longValue());
            }
            else if (valor instanceof Collection<?> colecao)
            {
                for (Object item : colecao)
                {
                    if (item instanceof Number numero)
                    {
                        acesso.exigir(recurso, numero.longValue());
                    }
                }
            }
        });
    }

    private static Object ler(RecordComponent componente, Object corpo)
    {
        try
        {
            return componente.getAccessor().invoke(corpo);
        }
        catch (ReflectiveOperationException falha)
        {
            throw new IllegalStateException("Não foi possível ler " + componente.getName(), falha);
        }
    }

    private static Object ler(Field campo, Object corpo)
    {
        try
        {
            campo.setAccessible(true);
            return campo.get(corpo);
        }
        catch (ReflectiveOperationException | RuntimeException falha)
        {
            throw new IllegalStateException("Não foi possível ler " + campo.getName(), falha);
        }
    }

    static String caminhoAtual()
    {
        return RequestContextHolder.getRequestAttributes() instanceof ServletRequestAttributes atributos
                ? atributos.getRequest().getRequestURI()
                : null;
    }
}
