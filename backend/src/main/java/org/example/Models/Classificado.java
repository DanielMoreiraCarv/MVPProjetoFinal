package org.example.Models;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.util.Set;

/**
 * Uma posição na classificação de uma fase. É ao mesmo tempo a saída de uma
 * fase e a entrada da seguinte, o que permite encadeá-las sem que uma conheça
 * o tipo da outra.
 *
 * Posições iguais representam empate. Cabe à fase que recebe decidir se aceita.
 */
public record Classificado(
        @Min(value = 1, message = "a posição na classificação começa em 1")
        int posicao,

        @NotNull(message = "classificado precisa referenciar um time")
        Long idTime)
{
    private static final Validator VALIDADOR =
            Validation.buildDefaultValidatorFactory().getValidator();

    public Classificado
    {
        // As anotações sozinhas só valem onde alguém chama a validação — num
        // @Valid de controller, por exemplo. Como este record é construído
        // dentro do domínio, a validação é acionada aqui para a restrição
        // valer sempre, e ser declarada num lugar só.
        exigirValido( "posicao", posicao );
        exigirValido( "idTime", idTime );
    }

    private static void exigirValido ( String campo, Object valor )
    {
        Set<ConstraintViolation<Classificado>> violacoes =
                VALIDADOR.validateValue( Classificado.class, campo, valor );

        if ( !violacoes.isEmpty() )
        {
            throw new ConstraintViolationException( violacoes );
        }
    }
}
