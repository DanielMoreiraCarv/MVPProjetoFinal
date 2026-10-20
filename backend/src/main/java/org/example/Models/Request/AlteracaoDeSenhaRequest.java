package org.example.Models.Request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/** O próprio usuário trocando a senha: precisa provar que sabe a atual. */
public record AlteracaoDeSenhaRequest(
        @NotBlank(message = "É preciso informar a senha atual")
        String senhaAtual,

        @NotBlank(message = "É preciso informar a nova senha")
        @Size(min = RegraDeSenha.MINIMO, max = RegraDeSenha.MAXIMO, message = RegraDeSenha.MENSAGEM_TAMANHO)
        @Pattern(regexp = RegraDeSenha.PADRAO, message = RegraDeSenha.MENSAGEM_PADRAO)
        String novaSenha
)
{
}
