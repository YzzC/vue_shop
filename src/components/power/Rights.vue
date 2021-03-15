<template>
    <div>
        <!-- 面包屑导航区 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">Home</el-breadcrumb-item>
            <el-breadcrumb-item>Rights Management</el-breadcrumb-item>
            <el-breadcrumb-item>Rights List</el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 卡片视图 -->
        <el-card>
            <el-table :data="rightsList" border stripe>
                <el-table-column type="index" label="#"></el-table-column>
                <el-table-column label="Rights" prop="authName"></el-table-column>
                <el-table-column label="Path" prop="path"></el-table-column>
                <el-table-column label="Rights level" prop="level">
                    <template slot-scope="scope">
                        <el-tag v-if="scope.row.level==='0'">Level 1</el-tag>
                        <el-tag type="success" v-else-if="scope.row.level==='1'">Level 2</el-tag>
                        <el-tag type="warning" v-else>Level 3</el-tag>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>
    </div>
</template>


<script>
    export default {
        data(){
            return{
                //权限列表
                rightsList:[],
            }
        },
        created(){
            this.getRightsList()
        },
        methods:{
            async getRightsList(){
                const {data:res} = await this.$http.get('rights/list')
                if(res.meta.status !== 200){
                    return this.$message.error('Fail to get rights list')
                }
                //数据挂载
                this.rightsList = res.data
                console.log(this.rightsList)
            },
        }
    }
</script>

<style lang="less" scoped>

</style>