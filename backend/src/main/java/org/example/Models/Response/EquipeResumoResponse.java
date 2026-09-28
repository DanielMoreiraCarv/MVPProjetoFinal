package org.example.Models.Response;

/**
 * A equipe vista de fora do seu próprio recurso: id e nome.
 *
 * `PartidaResponse` aninhava a `EquipeResponse` inteira, com o elenco
 * completo. Treze partidas de uma competição devolviam cinquenta mil bytes
 * porque cada uma carregava os trinta atletas das duas equipes — e a tela usa
 * o nome. Quem quiser o elenco pede `/equipe/{id}`.
 */
public record EquipeResumoResponse(Long id, String nome)
{
}
