package org.example.Exception;

import org.springframework.http.HttpStatus;

/**
 * Credencial recusada: senha errada, token vencido, conta bloqueada.
 *
 * Carrega o próprio status e código porque "não sei quem você é" (401) e
 * "errou demais, espere" (429) pedem respostas diferentes do cliente.
 */
public class AutenticacaoException extends ExceptionBase
{
    private final HttpStatus status;
    private final String codigo;

    public AutenticacaoException(HttpStatus status, String codigo, String mensagem)
    {
        super(mensagem);
        this.status = status;
        this.codigo = codigo;
    }

    /**
     * A mesma mensagem para e-mail inexistente e para senha errada: dizer qual
     * dos dois falhou ensina a quem tenta adivinhar quais e-mails existem.
     */
    public static AutenticacaoException credenciaisInvalidas()
    {
        return new AutenticacaoException(HttpStatus.UNAUTHORIZED, "CREDENCIAIS_INVALIDAS",
                "E-mail ou senha incorretos.");
    }

    public static AutenticacaoException sessaoInvalida()
    {
        return new AutenticacaoException(HttpStatus.UNAUTHORIZED, "SESSAO_INVALIDA",
                "A sessão expirou ou foi encerrada. Entre de novo.");
    }

    public HttpStatus getStatus()
    {
        return status;
    }

    public String getCodigo()
    {
        return codigo;
    }
}
