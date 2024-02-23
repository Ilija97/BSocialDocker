import { Producer, KafkaClient } from 'kafka-node';

const kafkaServers = process.env.KAFKA_BROKERCONNECT || 'localhost:9092';

const client = new KafkaClient({ kafkaHost: kafkaServers });
const producer = new Producer(client);

class KafkaProducer {
  static sendMessage(kafkaTopic: string, message: any): void {
    const payloads = [{ topic: kafkaTopic, messages: JSON.stringify(message) }];

    producer.send(payloads, (err, data) => {
      if (err) {
        console.error(`Error sending message to Kafka: ${err}`);
      } else {
        console.log(`Message sent to Kafka: ${JSON.stringify(data)}`);
      }
    });
  }
}

export default KafkaProducer;

