package org.example.Services;

import org.example.Exception.NaoEncontradoException;
import org.example.Models.Federacao;
import org.example.Models.Request.FederacaoCreateRequest;
import org.example.Models.Request.FederacaoUpdateRequest;
import org.example.Mapper.FederacaoMapper;
import org.example.Repositories.EquipeRepository;
import org.example.Repositories.FederacaoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FederacaoService
{
    @Autowired
    private FederacaoRepository federacaoRepository;

    @Autowired
    private EquipeRepository equipeRepository;

    public Federacao buscarPorId(Long id)
    {
        return federacaoRepository.findById(id).orElse(null);
    }

    public Federacao exigirPorId(Long id)
    {
        return federacaoRepository.findById(id)
                .orElseThrow(() -> NaoEncontradoException.de("Federação", id));
    }

    public List<Federacao> listarTodas()
    {
        return federacaoRepository.findAll();
    }

    public Federacao criar(FederacaoCreateRequest request)
    {
        return federacaoRepository.save(FederacaoMapper.toEntity(request));
    }

    public Federacao atualizar(Long id, FederacaoUpdateRequest request)
    {
        Federacao federacao = exigirPorId(id);
        return federacaoRepository.save(FederacaoMapper.toEntity(request, federacao));
    }

    /**
     * Recusa apagar federação com equipe vinculada.
     *
     * Sem isto o banco responderia com violação de chave estrangeira, que o
     * tratador traduz para "a operação conflita com um vínculo em uso" — certo,
     * porém sem dizer quantas equipes nem quais. Contar aqui deixa a mensagem
     * dizer o que precisa ser feito antes.
     */
    public void deletar(Long id)
    {
        Federacao federacao = exigirPorId(id);

        long equipes = equipeRepository.countByFederacaoId(id);
        if (equipes > 0)
        {
            throw new IllegalArgumentException(
                    "A federação " + federacao.getNomeFederacao() + " tem " + equipes
                            + (equipes == 1 ? " equipe vinculada" : " equipes vinculadas")
                            + ". Desvincule antes de excluir.");
        }

        federacaoRepository.deleteById(id);
    }
}
