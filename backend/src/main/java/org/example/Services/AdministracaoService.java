package org.example.Services;

import org.example.Models.Administracao;
import org.example.Models.Request.AdministracaoUpdateRequest;
import org.example.Exception.NaoEncontradoException;
import org.example.Repositories.AdministracaoRepository;
import org.example.Repositories.CompeticaoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class AdministracaoService {

    @Autowired
    private AdministracaoRepository administracaoRepository;

    @Autowired
    private CompeticaoRepository competicaoRepository;

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
        Administracao administracao = administracaoRepository.findById( id )
                .orElseThrow( () -> NaoEncontradoException.de( "Administração", id ) );

        int competicoes = competicaoRepository.findByAdministracaoId( id ).size();
        if ( competicoes > 0 ) {
            throw new IllegalArgumentException(
                    "A administração " + administracao.getNome() + " organiza " + competicoes
                            + ( competicoes == 1 ? " competição" : " competições" )
                            + ". Exclua as competições antes de excluir a administração." );
        }

        administracaoRepository.delete( administracao );
    }
}
