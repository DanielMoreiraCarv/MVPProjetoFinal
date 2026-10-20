package org.example.Models.Request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.util.List;

/** O administrador criando um usuário. Sem papéis, ele entra como PUBLICO. */
public record UsuarioCreateRequest(
        @NotBlank(message = "É preciso informar o nome")
        @Size(max = 180, message = "O nome pode ter até 180 caracteres")
        String nome,

        @NotBlank(message = "É preciso informar o e-mail")
        @Email(message = "O e-mail informado não é válido")
        @Size(max = 180, message = "O e-mail pode ter até 180 caracteres")
        String email,

        @NotBlank(message = "É preciso informar a senha")
        @Size(min = RegraDeSenha.MINIMO, max = RegraDeSenha.MAXIMO, message = RegraDeSenha.MENSAGEM_TAMANHO)
        @Pattern(regexp = RegraDeSenha.PADRAO, message = RegraDeSenha.MENSAGEM_PADRAO)
        String senha,

        List<@Valid PapelConcedidoRequest> papeis
)
{
}
