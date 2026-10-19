package org.example.Models.Response;

public record AtletaResponse(
        Long id,

        String nome,

        Integer idade,

        Integer numCamisa,

        String cpf,

        Integer pontos,

        Integer gols,

        Integer assistencias


)
{
}
