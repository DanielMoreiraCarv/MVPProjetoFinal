package org.example.Models.Response;

public record PaginacaoResponse(
        int paginaAtual,
        int tamanhoPagina,
        long totalElementos,
        int totalPaginas,
        boolean ultimaPagina
) {
}

