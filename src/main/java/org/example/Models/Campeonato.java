package org.example.Models;

import java.util.ArrayList;
import java.util.List;

public class Campeonato {

    private Long id;

    private String nome;

    private List<EnumTipoEsporte> lstEnumTipoEsporte;

    private List<Time> lstTimes;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public List<EnumTipoEsporte> getEnumTipoEsporte() {
        return lstEnumTipoEsporte;
    }

    public void setEnumTipoEsporte(List<EnumTipoEsporte> lstEnumTipoEsporte) {
        this.lstEnumTipoEsporte = lstEnumTipoEsporte;
    }

    public List<Time> getLstTimes() {
        return lstTimes;
    }

    public void setLstTimes(List<Time> lstTimes) {
        this.lstTimes = lstTimes;
    }

    public void adicionarTime(Time time){
        if(this.lstEnumTipoEsporte.contains(time.getEnumTipoEsporte())){
            this.lstTimes.add(time);
        }
        System.out.println("Esse time não pode participar desse campeonato!");
    }

    public void removerTime(Time time){
        this.lstTimes.remove(time);
    }

    public List<Time> listarTimesPorEsporte(EnumTipoEsporte enumTipoEsporte){
        List<Time> lstTimeEspote = new ArrayList<>();
        lstTimeEspote.addAll(this.lstTimes.stream().filter(p -> p.getEnumTipoEsporte()==enumTipoEsporte).toList());
        return lstTimeEspote;
    }
}
