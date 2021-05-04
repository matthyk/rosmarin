# Rosmarin.ts

[Rosmarin](https://en.wikipedia.org/wiki/Rosemary) is a framework to develop RESTful APIs with Node.js. There are a lot 
of npm packages that claim to allow developers to build RESTful APIs. However, these often ignore some fundamental 
constraints of REST. Especially the hypermedia constraint is often ignored. The goal of this framework is to provide 
Node.js developers a tool to effectively build REST APIs. In addition, care is taken to have as few dependencies as 
possible in the project.

This framework is heavily inspired by [Jersey](https://eclipse-ee4j.github.io/jersey/) and Norbury. Nobury is part of
the research project [GeMARA](https://fiw.fhws.de/forschung/projekte/gemara/) of the App.lab 
of the University of Applied Sciences Wuerzburg-Schweinfurt, which focuses on the automatic generation of REST APIs.

## Disclaimers

Although Rosmarin provides a lot of help to develop REST APIs, you should still have a basic understanding of the topic.
I recommend reading Roy Fielding's PhD thesis, in which he develops the REST architectural style.

Rosmarin is still in active development and has not yet reached version 0.1.0.

## Getting started

It is difficult to write a small and understandable example, because you need to understand some concepts of Rosmarin
before you can get started. But I promise, it's worth it!

Jump right into the [documentation](https://github.com/matthyk/rosmarin.ts/tree/main/docs)!

## Used dependencies

Rosmarin tries to use as few external dependencies as possible. However, modules were very deliberately selected for the 
core tasks that form the basis for Rosmarin.

All direct dependencies are briefly explained here.

### fastify
[Fastify](https://github.com/fastify/fastify) is a very fast and developer friendly web framework. It forms the basis for the entire project.

### TSyringe

[TSyringe](https://github.com/Microsoft/tsyringe) is a dependency injection container and is used throughout the project for better testing and to be easily 
configured by the developer.

### reflect-metadata

[reflect-metadata](https://github.com/rbuckton/reflect-metadata) is used by TSyringe, class-transformer and Rosmarin itself.

### class-transformer

[class-transformer](https://github.com/typestack/class-transformer) is used to transform plain object to a class instance.
This is important because only in this way it is possible to work with decorators, which are used heavily in Rosmarin.

### negotiator

[negotiator](https://github.com/jshttp/negotiator) is used to perform HTTP [content negotiation](https://tools.ietf.org/html/rfc7231#section-3.4).

### etag

[etag](https://github.com/jshttp/etag) is used to generate ETags. 
(Will probably soon be replaced by a better and more performant module.)

