// mug.h
// Copyright (c) 2011-2012 Meadhbh S. Hamrick, All Rights Reserved
//
// License info at https://github.com/OhMeadhbh/node-mug/raw/master/LICENSE

#ifndef _H_MUG
#define _H_MUG

#include <node.h>
#include <v8.h>

using namespace v8;

namespace mug {
  static Handle<Value> DefaultInterface( const Arguments & args );
  static Handle<Value> MACAddress( const Arguments & args );
}

#endif
