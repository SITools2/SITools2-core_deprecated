L�enregistrement et la gestion d�utilisateurs de Sitools v2 n�cessite une base de donn�es de type PostgreSQL ou MySQL,
incluse, mais qui doit �tre correctement configur�e.
Pour PostgreSQL, il faut cr�er une base de donn�es sur le serveur et ajouter un utilisateur � sitools �.
Il faut ensuite ex�cuter le script � pgsql_sitools.sql � (pr�sent dans le dossier � database/PGSQL  � � la racine du projet). 
Pour MySQL il faut faire de m�me en ex�cutant l�ensemble des scripts pr�sent dans le dossier � database/ MYSQL_CNES � sur un base de donn�es cr��e pr�c�demment.
Une fois la base cr��e et remplie, il faut configurer Sitools pour qu�il pointe vers cette base
(propri�t� � Starter.DATABASE_URL � du fichier sitools.properties ou directement dans l�installateur izPack lors de l�installation).
