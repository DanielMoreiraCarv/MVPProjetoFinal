package org.example.Models.Request;

public record EquipeUpdateRequest(
        Long id,

        String nome,

        Long idModalidade,

        Long idFederacao

)
{
}
