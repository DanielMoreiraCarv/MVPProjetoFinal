package org.example.Models.Response;

import java.util.List;

public record ValidacaoResponse(
        boolean valido,
        List<String> erros
)
{
}
