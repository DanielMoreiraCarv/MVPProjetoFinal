package org.example.Models.Request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/** O administrador definindo a senha de outro usuário, sem saber a anterior. */
public record RedefinicaoDeSenhaRequest(
        @NotBlank(message = "É preciso informar a nova senha")
        @Size(min = RegraDeSenha.MINIMO, max = RegraDeSenha.MAXIMO, message = RegraDeSenha.MENSAGEM_TAMANHO)
        @Pattern(regexp = RegraDeSenha.PADRAO, message = RegraDeSenha.MENSAGEM_PADRAO)
        String novaSenha
)
{
}
