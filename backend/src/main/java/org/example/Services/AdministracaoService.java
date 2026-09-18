package org.example.Services;

import org.example.Models.Administracao;
import org.example.Models.Request.AdministracaoUpdateRequest;
import org.example.Repositories.AdministracaoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class AdministracaoService {

    @Autowired
    private AdministracaoRepository administracaoRepository;

    public Administracao criar ( Administracao administracao ) {
        administracao.setId( null );
        return administracaoRepository.save( administracao );
    }

    public Administracao buscarPorId ( Long id ) {
        return administracaoRepository.findById( id ).orElse( null );
    }

    public List<Administracao> listarTodas () {
        return administracaoRepository.findAll();
    }

    public Administracao atualizar ( AdministracaoUpdateRequest request ) {
        Optional<Administracao> administracaoExistente = administracaoRepository.findById( request.id() );
        if ( administracaoExistente.isPresent() ) {
            Administracao administracao = administracaoExistente.get();
            administracao.setNome( request.nome() );
            administracao.setDescricao( request.descricao() );
            return administracaoRepository.save( administracao );
        }
        return null;
    }

    public void deletar ( Long id ) {
        administracaoRepository.deleteById( id );
    }
}
