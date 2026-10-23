package org.example.Models;

import jakarta.persistence.PrePersist;
import org.example.Seguranca.UsuarioCorrente;

/**
 * Quem cria é o dono. No listener, e não em cada serviço: um serviço novo que
 * esquecesse de preencher criaria um cadastro de ninguém, que ninguém vê.
 */
public class DonoAutomatico
{
    @PrePersist
    public void preencherDono(Object entidade)
    {
        if (entidade instanceof TemDono comDono && comDono.getDonoId() == null)
        {
            UsuarioCorrente.id().ifPresent(comDono::setDonoId);
        }
    }
}
