// node-mug.js
// Copyright (c) 2011 Meadhbh S. Hamrick, All Rights Reserved
//
// License info at https://github.com/OhMeadhbh/node-mug/raw/master/LICENSE

// This file creates RFC 4122 Version 4 (random) UUIDs using /dev/urandom
// as an entropy source.

(function() {
    var fs = require('fs');
    var hexString = "0123456789abcdef";
    var mug = {};

    if( module && module.exports ) {
        module.exports = mug;
    }

    function uuid ( buffer ) {
        this.buffer = buffer;
    }

    var makeRandom = function ( buffer ) {
        buffer[ 8 ] = ( buffer[ 8 ] & 0x3F ) | 0x80;
        buffer[ 6 ] = ( buffer[ 6 ] & 0x0F ) | 0x40;
    };

    uuid.prototype.toString = function () {
        var rv;
        if( this.string ) {
            rv = this.string;
        } else {
            rv = "";
            for( var i = 0; i < 16; i++ ) {
                var j = this.buffer[i];
                rv += hexString.substr( ( j >> 4 ) & 0x0F, 1);
                rv += hexString.substr( j & 0x0F, 1 );
                if( ( i == 3 ) || ( i == 5 ) || ( i == 7 ) || ( i == 9 ) ) {
                    rv += '-';
                }
            }
            this.string = rv;
        }
        return( rv );
    };

    uuid.prototype.toURN = function () {
        if( ! this.urn ) {
            this.urn = 'urn:uuid:' + this.toString();
        }
        return( this.urn );
    };

    function generator ( options, fd ) {
        this.options = options;
        this.fd = fd;
        this.seek = 0;
    }

    generator.prototype.generate = function ( callback, target ) {
        var localSeek = this.seek;
        this.seek += 16;
        var localRead = 0;
        var localFd = this.fd;
        
        if( ! target ) {
            target = new Buffer( 16 );
        }

        var readCallback = function ( err, read, buffer ) {
            if( err ) {
                throw( err );
            } else {
                localRead += read;
                localSeek += read;
                if( localRead < 16 ) {
                    fs.read( localFd, buffer, localRead, 16 - localRead, localSeek + localRead, readCallback );
                } else {
                    makeRandom( buffer );
                    callback( new uuid( buffer ) );
                }
            }
        };

        readCallback( null, 0, target );
        
    };

    mug.TIME   = 1;
    mug.MD5    = 3;
    mug.RANDOM = 4;
    mug.SHA1   = 5;

    var nullUUIDBuffer = new Buffer(16);
    for( var i = 0; i < 16; i++ ) {
        nullUUIDBuffer[i] = 0;
    }
    
    mug.NullUUID = new uuid( nullUUIDBuffer );

    mug.createInstance = function ( options, callback ) {
        
        if( 'function' === typeof( options ) ) {
            callback = options;
            options = {};
        }

        if( ! options ) {
            options = {};
        }

        if( ! options.version ) {
            options.version = this.RANDOM;
        }

        var randomConstructor = function( options, callback ) {
            
            if( ! options.source ) {
                options.source = '/dev/urandom';
            } 
            
            var openCallback = function ( err, fd ) {
                if( !err && callback ) {
                    callback( new generator( options, fd ) );
                } else {
                    if( fd ) {
                        fs.close(fd);
                    }
                    throw( err );
                }
            };

            fs.open( options.source, 'r', 0666, openCallback );
        };

        switch( options.version ) {
            case this.TIME:
            break;
            
            case this.MD5:
            break;
            
            case this.RANDOM:
            randomConstructor( options, callback );
            break;
            
            case this.SHA1:
            break;
            
            default:
            break;
        }
    };
}());
