package org.example.Config;

import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;

import java.net.Socket;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Toda tabela do schema public tem row level security. No Supabase, a que não
 * tiver fica aberta pela API REST automática dele, por fora da nossa porta.
 * Uma migração que cria tabela sem `enable row level security` quebra aqui.
 */
@SpringBootTest
class RlsEmTodasAsTabelasTest
{
    @Autowired
    private JdbcTemplate jdbc;

    @BeforeAll
    static void exigirBanco()
    {
        try (Socket ignorado = new Socket("localhost", 5433))
        {
            // no ar
        }
        catch (Exception falha)
        {
            throw new IllegalStateException("""
                    Postgres local indisponível em localhost:5433. Suba o ambiente antes de rodar os testes:
                      ./deploy/ambiente.sh subir""");
        }
    }

    @Test
    void nenhumaTabelaSemRls()
    {
        List<String> abertas = jdbc.queryForList("""
                select c.relname
                from pg_class c
                join pg_namespace n on n.oid = c.relnamespace
                where n.nspname = 'public' and c.relkind = 'r' and not c.relrowsecurity
                order by c.relname
                """, String.class);

        assertThat(abertas).as("tabelas sem row level security").isEmpty();
    }
}
