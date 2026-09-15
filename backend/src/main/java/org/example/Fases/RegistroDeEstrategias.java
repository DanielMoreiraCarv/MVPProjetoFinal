package org.example.Fases;

import org.example.Models.EnumFasePartida;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

/** Resolve a estratégia pelo tipo estático da fase. */
@Component
public class RegistroDeEstrategias
{
    private final Map<EnumFasePartida, EstrategiaDeFase> porTipo;

    public RegistroDeEstrategias ( List<EstrategiaDeFase> estrategias )
    {
        this.porTipo = estrategias.stream()
                                  .collect( Collectors.toMap( EstrategiaDeFase::tipo,
                                          Function.identity() ) );
    }

    public EstrategiaDeFase para ( EnumFasePartida tipo )
    {
        EstrategiaDeFase estrategia = porTipo.get( tipo );

        if ( estrategia == null )
        {
            throw new IllegalArgumentException(
                    "não há estratégia registrada para o tipo de fase " + tipo );
        }

        return estrategia;
    }

    public boolean conhece ( EnumFasePartida tipo )
    {
        return porTipo.containsKey( tipo );
    }

    public List<EstrategiaDeFase> todas ()
    {
        return List.copyOf( porTipo.values() );
    }
}
