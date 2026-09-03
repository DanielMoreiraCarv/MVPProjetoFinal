package org.example.Models.Response;

import java.util.List;

public record ResponseEntityBasePaginado<T>(
        List<T> conteudo,
        PaginacaoResponse paginacao
) {
}
