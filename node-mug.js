// node-mug.js
// Copyright (c) 2011 Meadhbh S. Hamrick, All Rights Reserved
//
// License info at https://github.com/OhMeadhbh/node-mug/raw/master/LICENSE

// This file creates RFC 4122 Version 4 (random) UUIDs using /dev/urandom
// as an entropy source.

(function() {
    var fs = require('fs');
    var crypto = require('crypto');
    var hexString = "0123456789abcdef";
    var mug = {};

    if( module && module.exports ) {
        module.exports = mug;
    }

    // uuid class - these are the things we return from calls to the uuid
    // generator. The make{Random|MD5|etc.} methods munge bits in the buffer
    // to set the version. 

    function uuid ( buffer ) {
        this.buffer = buffer;
    }

    uuid.prototype.makeRandom = function ( ) {
        this.buffer[ 8 ] = ( this.buffer[ 8 ] & 0x3F ) | 0x80;
        this.buffer[ 6 ] = ( this.buffer[ 6 ] & 0x0F ) | 0x40;
    };

    uuid.prototype.makeMD5= function ( ) {
        this.buffer[ 8 ] = ( this.buffer[ 8 ] & 0x3F ) | 0x80;
        this.buffer[ 6 ] = ( this.buffer[ 6 ] & 0x0F ) | 0x30;
    };

    uuid.prototype.makeSHA1 = function ( ) {
        this.buffer[ 8 ] = ( this.buffer[ 8 ] & 0x3F ) | 0x80;
        this.buffer[ 6 ] = ( this.buffer[ 6 ] & 0x0F ) | 0x50;
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

    // If a file descriptor is passed in, then we assume we're reading from
    // a file. if fd is null or undefined, we assume we're reading our random
    // bytes from crypto.randomBytes()

    function randomGenerator ( options, fd ) {
        this.options = options;
        this.fd = fd;
        this.seek = 0;
    }

    randomGenerator.prototype.generate = function ( callback, name, target ) {
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
                    var u = new uuid( buffer );
                    u.makeRandom();
                    callback( u );
                }
            }
        };

        function randomCallback ( buffer ) {
            crypto.randomBytes( 16, function ( ex, randomBuffer ) {
                for( var i = 0; i < 16; i++ ) {
                    buffer[i] = randomBuffer[i]
                }
                var u = new uuid( buffer );
                u.makeRandom();
                callback( u );
            } );
        }

        if( this.fd ) {
            readCallback( null, 0, target );
        } else {
            randomCallback( target );
        }
    };
    
    randomGenerator.prototype.close = function ( callback ) {
        if( this.fd ) {
            fs.close( this.fd, callback );
        }
    };

    function md5Generator ( options ) {
        this.options = options;
    } 
    
    md5Generator.prototype.generate = function ( callback, name, target ) {
        var hash;
        var digest;
        
        if( ! target ) {
            target = new Buffer(16);
        }
        
        hash = crypto.createHash( 'md5' );
        hash.update( name );
        digest = hash.digest('binary');

        target.write( digest, 0, 'binary' );
        var u = new uuid( target );
        u.makeMD5();
        
        callback( u );
    };
    
    md5Generator.prototype.close = function ( callback ) {
        callback();
    };
    
    function sha1Generator ( options ) {
        this.options = options;
    } 
    
    sha1Generator.prototype.generate = function ( callback, name, target ) {
        var hash;
        var digest;
        
        if( ! target ) {
            target = new Buffer(20);
        }
        
        hash = crypto.createHash( 'sha1' );
        hash.update( name );
        digest = hash.digest('binary');

        target.write( digest, 0, 'binary' );
        var u = new uuid( target );
        u.makeSHA1();
        
        callback( u );
    };

    sha1Generator.prototype.close = function ( callback ) {
        callback();
    };
    
    mug.TIME   = 1;
    mug.MD5    = 3;
    mug.RANDOM = 4;
    mug.SHA1   = 5;

    var nullUUIDBuffer = new Buffer(16);
    for( var i = 0; i < 16; i++ ) {
        nullUUIDBuffer[i] = 0;
    }
    
    mug.uuid = uuid;
    
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
                callback( new randomGenerator( options, null ) );
            } else {
                var openCallback = function ( err, fd ) {
                    if( !err && callback ) {
                        callback( new randomGenerator( options, fd ) );
                    } else {
                        if( fd ) {
                            fs.close(fd);
                        }
                        throw( err );
                    }
                };

                fs.open( options.source, 'r', 0666, openCallback );
            }
        };
        
        var md5Constructor = function ( options, callback ) {
        };

        switch( options.version ) {
            case this.TIME:
            break;
            
            case this.MD5:
            callback && callback( new md5Generator( options ) );
            break;
            
            case this.RANDOM:
            randomConstructor( options, callback );
            break;
            
            case this.SHA1:
            callback && callback( new sha1Generator( options ) );
            break;
            
            default:
            break;
        }
    };
}());
