# base image
FROM pelias/baseimage

# change working dir
ENV WORKDIR /code/pelias/schema
WORKDIR ${WORKDIR}

# add code from local checkout to image
ADD . ${WORKDIR}

# install npm dependencies
RUN npm install

# run tests
RUN npm test
