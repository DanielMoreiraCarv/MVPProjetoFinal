package org.example.Exception;

/**
 * O registro pedido não existe.
 *
 * Existe para o 404 ter corpo. Os controllers devolviam
 * `ResponseEntity.notFound().build()` — resposta sem nada dentro, que na tela
 * virava "a requisição falhou" sem dizer o que não foi achado. Lançar daqui
 * deixa o tratador central responder com o recurso e o id que faltaram.
 */
public class NaoEncontradoException extends ExceptionBase
{
    public NaoEncontradoException(String mensagem)
    {
        super(mensagem);
    }

    /** "Competição 42 não encontrada." */
    public static NaoEncontradoException de(String recurso, Object id)
    {
        return new NaoEncontradoException(recurso + " " + id + " não encontrada.");
    }
}
