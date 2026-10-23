package org.example.Config;

import org.example.Exception.AutenticacaoException;
import org.example.Exception.ExceptionBase;
import org.example.Exception.NaoEncontradoException;
import org.example.Models.Response.ErroResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.NoHandlerFoundException;

import java.util.List;
import java.util.NoSuchElementException;

/**
 * Um lugar só para transformar falha em resposta.
 *
 * Antes disto cada controller tinha o seu `catch (Exception e) -> badRequest()
 * .build()`: a resposta saía sem corpo e sem causa, e a tela só tinha como
 * dizer "a requisição falhou (HTTP 400)". O RNF07 pede a causa e a ação
 * corretiva; sem um corpo de erro não havia como cumprir.
 *
 * A regra de tradução é: o que o cliente pode corrigir vira 4xx com a
 * mensagem de verdade; o que ele não pode vira 500 com mensagem genérica e o
 * detalhe no log. Mensagem de exceção interna não vaza para a resposta — nem
 * por conveniência de depuração, porque é assim que nome de tabela e consulta
 * SQL acabam na tela de quem usa.
 */
@RestControllerAdvice
public class TratadorDeErros
{
    private static final Logger LOG = LoggerFactory.getLogger(TratadorDeErros.class);

    /** Bean Validation nos DTOs de entrada: diz qual campo e por quê. */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErroResponse> validacao(MethodArgumentNotValidException excecao)
    {
        List<ErroResponse.Detalhe> detalhes = excecao.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(erro -> new ErroResponse.Detalhe(erro.getField(), erro.getDefaultMessage()))
                .toList();

        return ResponseEntity.badRequest()
                .body(ErroResponse.de("VALIDACAO_FALHOU",
                        "Verifique os campos informados.",
                        detalhes));
    }

    /** Mais específica que ExceptionBase, então vem antes dela. */
    @ExceptionHandler(NaoEncontradoException.class)
    public ResponseEntity<ErroResponse> naoEncontradoNoDominio(NaoEncontradoException excecao)
    {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ErroResponse.de("NAO_ENCONTRADO", excecao.getMessage()));
    }

    /** Também mais específica que ExceptionBase: traz o próprio status (401, 403, 429). */
    @ExceptionHandler(AutenticacaoException.class)
    public ResponseEntity<ErroResponse> autenticacao(AutenticacaoException excecao)
    {
        return ResponseEntity.status(excecao.getStatus())
                .body(ErroResponse.de(excecao.getCodigo(), excecao.getMessage()));
    }

    /**
     * As exceções do próprio domínio. A mensagem delas é escrita para ser
     * lida por quem usa, então vai para a resposta.
     */
    @ExceptionHandler(ExceptionBase.class)
    public ResponseEntity<ErroResponse> dominio(ExceptionBase excecao)
    {
        return ResponseEntity.badRequest()
                .body(ErroResponse.de("REGRA_VIOLADA", excecao.getMessage()));
    }

    /**
     * O motor de fases sinaliza configuração impossível com estas duas —
     * "um mata-mata precisa de ao menos 2 equipes, recebeu 1" é mensagem para
     * a tela, não defeito de programação.
     */
    @ExceptionHandler({IllegalArgumentException.class, IllegalStateException.class})
    public ResponseEntity<ErroResponse> regra(RuntimeException excecao)
    {
        return ResponseEntity.badRequest()
                .body(ErroResponse.de("REGRA_VIOLADA", excecao.getMessage()));
    }

    @ExceptionHandler(NoSuchElementException.class)
    public ResponseEntity<ErroResponse> naoEncontrado(NoSuchElementException excecao)
    {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ErroResponse.de("NAO_ENCONTRADO", "O registro não foi encontrado."));
    }

    /**
     * Unicidade e chave estrangeira. A mensagem do banco cita tabela, coluna e
     * nome de constraint — nada disso vai para a tela.
     */
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ErroResponse> integridade(DataIntegrityViolationException excecao)
    {
        LOG.warn("violação de integridade", excecao);
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(ErroResponse.de("CONFLITO",
                        "A operação conflita com um registro que já existe ou com um vínculo em uso."));
    }

    /** Corpo que não é JSON válido, ou tipo errado no caminho e na query. */
    @ExceptionHandler({HttpMessageNotReadableException.class,
            MethodArgumentTypeMismatchException.class,
            MissingServletRequestParameterException.class})
    public ResponseEntity<ErroResponse> entradaMalFormada(Exception excecao)
    {
        return ResponseEntity.badRequest()
                .body(ErroResponse.de("ENTRADA_INVALIDA",
                        "A requisição não pôde ser interpretada. Confira o corpo e os parâmetros."));
    }

    @ExceptionHandler(NoHandlerFoundException.class)
    public ResponseEntity<ErroResponse> rotaInexistente(NoHandlerFoundException excecao)
    {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ErroResponse.de("ROTA_INEXISTENTE", "Esta rota não existe."));
    }

    /**
     * O que sobrou é defeito nosso. Vai 500 com mensagem genérica, e o stack
     * inteiro para o log: é lá que ele serve, não na resposta.
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErroResponse> inesperado(Exception excecao)
    {
        LOG.error("falha não tratada", excecao);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ErroResponse.de("ERRO_INTERNO",
                        "Algo falhou no servidor. Tente de novo em instantes."));
    }
}
