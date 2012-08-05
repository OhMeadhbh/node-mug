#!/usr/bin/env python

from os import popen

src = '.'
bld = 'build'
ver = '0.0.1'

def set_options( opt ):
  opt.tool_options( 'compiler_cxx' )

def configure( conf ):
  conf.check_tool( 'compiler_cxx' )
  conf.check_tool( 'node_addon' )
  
def build( _build ):
  obj = _build.new_task_gen( 'cxx', 'shlib', 'node_addon' )
  obj.target = "mug"
  obj.source = [ "src/mug.cc" ]
