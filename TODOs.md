# TODOs

This document is to keep track of the technical debt in this repository.

Global:

- Change "DomainModelService" to "EntityService"
- Remove "getResourcesList" method from EntityService class.
- Make TransactionManager and BatchManager
- Add update validations when updating transaction's categoryId
- Refactor environment variables handling
- Implement text search
- Automatic openapi documentation
- Functional tests
- Add rules for method orders and private methods to be prefixed
- Refactor unit tests rules and make the corresponding changes to the existing unit tests
- Add rules to always ad jsdoc documentation (don't forget to include Throws)
- Add explanation about repositories and value types
- Check how to admin oauth clients and private keys
- Apply cache to transactions category in public api
- Be able to create documents with defined id
- Check that all methods have JSdoc
- Add github action to check that conventions are being met. [Video](https://www.youtube.com/watch?v=ohjMGnEaBxk)

Google:

- Make Cloud Functions access secrets
- Rethink repositories inside functions
