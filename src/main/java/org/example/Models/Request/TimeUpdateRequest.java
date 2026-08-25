package org.example.Models.Request;

public record TimeUpdateRequest(
        Long id,

        String nome,

        Long idModalidade,

        Long idFederacao

)
{
}
