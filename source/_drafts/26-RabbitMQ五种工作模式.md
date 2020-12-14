---
title: 「25」RabbitMQ五种工作模式
date: '2020/12/14 00:00:17'
updated: '2020/11/30 00:00:17'
keywords: 'RabbitMQ,消息中间件'
tags:
  - RabbitMQ
  - 消息中间件
---


最近本来只想简单学习一下子RabbitMQ，后在男票强迫下写了这篇总结文档，哈哈哈哈...
以上就是我写这篇文档的初衷，仅供和我一样的小白参考。


第一种
  简单队列（一对一模式）
  --简单地说，就是一个生产者对应一个消费者。


生产者：
public class Product {

    /**
     * 一对一关系，一个生产者对应一个消费者
     * @throws Exception
     */
    public void send() throws Exception{
        //1.创建连接
        ConnectionFactory factory = new ConnectionFactory();
        //2.设置参数
        factory.setHost("localhost");//设置地址
        factory.setPort(22);//设置端口号
        factory.setUsername("user");//设置用户名
        factory.setPassword("123456");//设置密码
        factory.setVirtualHost("/"); //设置虚拟机

        //3. 在连接工厂中创建新的连接
        Connection connection = factory.newConnection();

        //4.新增信道用于通信
        Channel channel  = connection.createChannel();

        //5.绑定队列
        /**
         * 参数1：队列名称-若不存在则会创建
         * 参数2：是否给队列持久化-false则重启时消息会丢失不会持久化
         * 参数3：是否独享信道-true则只有当前连接可连接
         * 参数4：是否用完自动删除-false不删除
         * 参数5：其他参数
         */
        channel.queueDeclare("hello", true, false, false, null);

        //6.发送消息
        /**
         * 参数1：交换机
         * 参数2：队列名
         * 参数3：相关属性（消息持久化）-保持消息体进行持久化，null则不对消息持久化
         * 参数4：消息体
         */
        channel.basicPublish("", "hello", MessageProperties.PERSISTENT_TEXT_PLAIN, "This is a queue message".getBytes());

        //7.关闭通道和连接
        channel.close();
        connection.close();
        System.out.println("消息已被发送");

    }
}


消费者：
public class Consumer {

    public void send() throws Exception{
        //1.创建连接
        ConnectionFactory factory = new ConnectionFactory();
        //2.设置参数
        factory.setHost("localhost");//设置地址
        factory.setPort(22);//设置端口号
        factory.setUsername("user");//设置用户名
        factory.setPassword("123456");//设置密码
        factory.setVirtualHost("/"); //设置虚拟机

        //3. 在连接工厂中创建新的连接
        Connection connection = factory.newConnection();

        //4.新增信道用于通信
        Channel channel  = connection.createChannel();

        //5.绑定队列
        /**
         * 参数1：队列名称-若不存在则会创建
         * 参数2：是否持久化-false则重启时消息会丢失不会持久化
         * 参数3：是否独享信道-true则只有当前连接可连接
         * 参数4：是否用完自动删除
         * 参数5：其他参数
         */
        channel.queueDeclare("hello", true, false, false, null);

        //6.接受消息
        channel.basicConsume("hello", true, new DefaultConsumer(channel){
            @Override
            public void handleDelivery(String consumerTag, Envelope envelope, AMQP.BasicProperties properties, byte[] body) throws IOException {
                System.out.println("消息内容是"+body.toString());

            }
        });

        //不能回调输出消息,为了不让程序结束
        System.in.read();

    }
}

