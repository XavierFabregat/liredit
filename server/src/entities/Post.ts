import { Entity, OptionalProps, PrimaryKey, Property } from "@mikro-orm/core";
import { Field, Int, ObjectType } from "type-graphql";

@ObjectType()
@Entity()
export class Post {

    [OptionalProps]?: 'createdAt' | 'updatedAt';

    @Field(() => Int)
    @PrimaryKey()
    id!: number;

    
    @Field(() => String)
    @Property({ type: 'date' })
    createdAt = new Date();


    @Field(() => String)
    @Property({ onUpdate: () => new Date(), type: 'date' })
    updatedAt = new Date();


    @Field(() => String)
    @Property({ type: 'text' })
    title!: string;
}