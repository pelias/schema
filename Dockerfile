# base image
FROM pelias/baseimage

# change working dir
ENV WORKDIR /code/pelias/schema
WORKDIR ${WORKDIR}

# copy package.json first to prevent npm install being rerun when only code changes
COPY ./package.json ${WORK}
RUN npm install

# add code from local checkout to image
ADD . ${WORKDIR}

# run as pelias user
USER pelias
