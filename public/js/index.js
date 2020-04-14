"use strict";

$(function() {
    $( "#share-form" ).on( "submit", function( e ) {
        e.preventDefault();
        var $form = $( this );

        $form.find( ".alert" ).remove();

        $.post( "/publish", $form.serialize(), function( res ) {
            if( res.errors ) {
                res.errors.forEach(function( err ) {
                    $( "#" + err.param ).after( '<div class="alert alert-danger mt-3 mb-3">' + err.msg + '</div>' );
                });
            } else if( res.error ) {
                $form.append( '<div class="alert alert-danger mt-3 mb-3">' + res.error + '</div>' ); 
            } else if( res.success ) {
                $form.append( '<div class="alert alert-success mt-3 mb-3">' + res.success + '</div>' ); 
            }
        });
    });
});