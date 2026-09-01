package org.example.Config;

import org.example.Models.Modalidade;
import org.example.Repositories.ModalidadeRepository;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Catálogo de modalidades exigido pelo RF24. É dado de referência, não dado de
 * usuário: a carga é idempotente e roda em qualquer ambiente.
 */
@Component
public class CargaInicialModalidades implements ApplicationRunner {

    private static final List<Modalidade> CATALOGO = List.of(
            new Modalidade("FUTEBOL_DE_CAMPO", "Futebol de campo", 11),
            new Modalidade("FUTSAL", "Futsal", 5),
            new Modalidade("SOCIETY", "Society", 7),
            new Modalidade("VOLEIBOL", "Voleibol", 6),
            new Modalidade("BASQUETE", "Basquete", 5),
            new Modalidade("HANDEBOL", "Handebol", 7)
    );

    private final ModalidadeRepository modalidadeRepository;

    public CargaInicialModalidades ( ModalidadeRepository modalidadeRepository )
    {
        this.modalidadeRepository = modalidadeRepository;
    }

    @Override
    public void run ( ApplicationArguments args )
    {
        CATALOGO.stream()
                .filter( modalidade -> modalidadeRepository.findByCodigo( modalidade.getCodigo() ).isEmpty() )
                .forEach( modalidadeRepository::save );
    }
}
