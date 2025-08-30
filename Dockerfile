FROM apify/actor-node:16

COPY package*.json ./
RUN npm --quiet set progress=false \
    && npm install --omit=dev --omit=optional

COPY . ./

CMD npm start
