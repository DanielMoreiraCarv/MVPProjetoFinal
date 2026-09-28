package org.example.Models.Request;

import jakarta.validation.constraints.NotBlank;

/**
 * `federacao` é texto porque a coluna é texto: `Arbitro.federacao` é um nome
 * solto, não uma chave para a tabela `federacao`. O create pedia `Long` e o
 * update `String`, para a mesma coluna — e nenhum dos dois convertia.
 *
 * Unificar as duas assinaturas é o passo possível agora. Transformar em chave
 * estrangeira de verdade é mudança de modelo e fica registrado.
 */
public record ArbitroCreateRequest(
        @NotBlank(message = "É preciso informar o nome do árbitro")
        String nome,

        String federacao,

        String categoria
)
{
}
