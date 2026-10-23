package org.example.Models.Request;

/**
 * A regra de senha num lugar só, para cadastro, troca e redefinição dizerem a
 * mesma coisa.
 *
 * O teto de 72 não é escolha: o BCrypt ignora tudo depois do 72º byte, e
 * aceitar mais faria duas senhas diferentes valerem a mesma.
 */
public final class RegraDeSenha
{
    public static final int MINIMO = 8;
    public static final int MAXIMO = 72;

    /** Ao menos uma letra e um número. */
    public static final String PADRAO = "^(?=.*\\p{L})(?=.*\\d).+$";

    public static final String MENSAGEM_TAMANHO = "A senha precisa ter entre 8 e 72 caracteres";
    public static final String MENSAGEM_PADRAO = "A senha precisa ter ao menos uma letra e um número";

    private RegraDeSenha()
    {
    }
}
