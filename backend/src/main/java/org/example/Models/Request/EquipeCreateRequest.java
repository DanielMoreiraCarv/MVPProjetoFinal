package org.example.Models.Request;

public record EquipeCreateRequest(
        String nome,

        Long idModalidade,

        Long idFederacao

)
{
}
