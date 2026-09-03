package org.example.Services;

import org.example.Models.Modalidade;
import org.example.Repositories.ModalidadeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ModalidadeService {

    @Autowired
    private ModalidadeRepository modalidadeRepository;

    public List<Modalidade> listarAtivas() {
        return modalidadeRepository.findByAtivoTrue();
    }

    public Modalidade buscarPorId(Long id) {
        return modalidadeRepository.findById(id).orElse(null);
    }

    public Modalidade buscarPorCodigo(String codigo) {
        return modalidadeRepository.findByCodigo(codigo).orElse(null);
    }

    public Modalidade exigirPorId(Long id) {
        return modalidadeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Modalidade " + id + " não encontrada."));
    }
}
