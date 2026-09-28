package org.example.Models.Request;

import jakarta.validation.constraints.NotNull;
import org.example.Models.EnumEstadoCompeticao;

public record CompeticaoEstadoRequest(
        @NotNull(message = "É preciso informar o estado")
        EnumEstadoCompeticao estado
)
{
}
