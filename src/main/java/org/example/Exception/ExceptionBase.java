package org.example.Exception;

public class ExceptionBase extends RuntimeException
{
    public ExceptionBase ( String message )
    {
        super( message );
    }

    public ExceptionBase ( String message, Throwable cause )
    {
        super( message, cause );
    }
}
