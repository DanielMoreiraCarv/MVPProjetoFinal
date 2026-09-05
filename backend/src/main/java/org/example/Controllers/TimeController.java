package org.example.Controllers;

import org.example.Mapper.TimeMapper;
import org.example.Models.Request.TimeCreateRequest;
import org.example.Models.Request.TimeUpdateRequest;
import org.example.Models.Response.TimeResponse;
import org.example.Models.Time;
import org.example.Services.TimeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/time")
@CrossOrigin(origins = "*")
public class TimeController
{
    @Autowired
    private TimeService timeService;

    @PostMapping
    public ResponseEntity<TimeResponse> criarTime (
            @RequestBody TimeCreateRequest request
    )
    {

        Time time = timeService.criarTime(
                TimeMapper.toEntity( request )
        );

        return ResponseEntity
                .status( HttpStatus.CREATED )
                .body( TimeMapper.toResponse( time ) );
    }

    @PutMapping
    public ResponseEntity<TimeResponse> atualizarTime (@RequestBody TimeUpdateRequest request){
        Time time = timeService.buscarPorId( request.id() );
        if (time == null){
            return ResponseEntity.notFound().build();
        }

        Time timeAtualziado = timeService.atualizarTime( request.id(), request);

        return ResponseEntity
                .status( HttpStatus.OK )
                .body( TimeMapper.toResponse( timeAtualziado ) );
    }

    @GetMapping
    public ResponseEntity<List<TimeResponse>> listarTime (){
        List<TimeResponse> times = TimeMapper.toResponse( timeService.listarTodos() );


        return ResponseEntity
                .status( HttpStatus.OK )
                .body( times );
    }

    @GetMapping("/{id}")
    public ResponseEntity<TimeResponse> getTime (@PathVariable Long id){
        Time time = timeService.buscarPorId( id );

        if( time == null )
        {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity
                .status( HttpStatus.OK )
                .body( TimeMapper.toResponse( time ) );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTime ( @PathVariable Long id )
    {
        Time time = timeService.buscarPorId( id );

        if( time == null )
        {
            return ResponseEntity.notFound().build();
        }

        timeService.deletarTime( id );

        return ResponseEntity
                .status( HttpStatus.OK ).build();
    }


}