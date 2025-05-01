import { Admin, AdminConfig, ConsumerConfig, EachMessagePayload, Kafka, KafkaConfig, Producer } from "kafkajs";

export class KafkaHelper{
    private kafka: Kafka;
    private admin: Admin;
    private kafkaProducer: Producer;
    private consumers: Map<string, any> = new Map();

    constructor(kafkaConfig: KafkaConfig, adminConfig?: AdminConfig){
        this.kafka = new Kafka(kafkaConfig);
        this.admin = this.kafka.admin(adminConfig);
        this.kafkaProducer = this.kafka.producer();
    }

    // admin management
    async connectAdmin(){
        try{
            await this.admin.connect();
        }
        catch(error){

        }
    }

    async disconnectAdmin(){
        try{
            await this.admin.disconnect();
        }
        catch(error){

        }
    }

    // topic management
    async createTopics(topicConfig: {topic: string; numPartitions: number; replicationFactor: number}[]){
        try{
            const result = await this.admin.createTopics({
                topics: topicConfig,
                timeout: 30000,
                waitForLeaders: true
            })
        }
        catch(error){

        }
    }

    async deleteTopics(topics: string[]){
        try{
            await this.admin.deleteTopics({
                topics: topics,
                timeout: 30000
            })
        }
        catch(error){

        }
    }

    // producer management
    async connectProducer(){
        try{
            await this.kafkaProducer.connect();
        }
        catch(error){

        }
    }

    async disconnectProducer(){
        try{
            await this.kafkaProducer.disconnect();
        }
        catch(error){

        }
    }

    // consumer management
    async initializeConsumer(topic: string, groupId: string, eachMessageHandler: (payload: EachMessagePayload) => Promise<void>){
        try{
            const consumerConfig: ConsumerConfig = {groupId: groupId};
            const consumer = this.kafka.consumer(consumerConfig);

            await consumer.connect();
            await consumer.subscribe({topic, fromBeginning: true});
            await consumer.run({
                eachMessage: async (payload) => {
                    await eachMessageHandler(payload)
                }
            })

            this.consumers.set(topic, consumer);
        }
        catch(error){

        }
    }

    async disconnectConsumer(topic: string){
        const consumers = this.consumers.get(topic)
        try{
            await consumers.disconnect();
        }
        catch(error){
            
        }
    }

}