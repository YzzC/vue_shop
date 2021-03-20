<template>
    <div>
        <!-- 面包屑导航区 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">Home</el-breadcrumb-item>
            <el-breadcrumb-item>Goods Management</el-breadcrumb-item>
            <el-breadcrumb-item>Goods List</el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 卡片视图区 -->
        <el-card>
            <el-row :gutter="20">
                <el-col :span="8">
                    <el-input placeholder="Please search" v-model="queryInfo.query" clearable @clear="getGoodsList">
                        <el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
                    </el-input>
                </el-col>
                <el-col :span="4">
                    <el-button type="primary" @click="goAddPage">Add goods</el-button>
                </el-col>
            </el-row>

            <!-- table表格区域 -->
            <el-table :data="goodslist" border stripe>
                <el-table-column type="index" label="#"></el-table-column>
                <el-table-column label="Goods" prop="goods_name"></el-table-column>
                <el-table-column label="Price($)" prop="goods_price" width="95px"></el-table-column>
                <el-table-column label="Weights" prop="goods_weight" width="70px"></el-table-column>
                <el-table-column label="Add Time" prop="add_time" width="140px">
                    <template slot-scope="scope">
                        {{scope.row.add_time | dateFormat}}
                    </template>
                </el-table-column>
                <el-table-column label="Operation" width="130px">
                    <template slot-scope="scope">
                        <el-button type="primary" icon="el-icon-edit" size="mini"></el-button>
                        <el-button type="danger" icon="el-icon-delete" size="mini"
                            @click="removeById(scope.row.goods_id)"></el-button>
                    </template>
                </el-table-column>
            </el-table>

            <!-- 分页区域 -->
            <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
                :current-page="queryInfo.pagenum" :page-sizes="[5, 10, 15, 20]" :page-size="queryInfo.pagesize"
                layout="total, sizes, prev, pager, next, jumper" :total="total" backgound>
            </el-pagination>
        </el-card>
    </div>
</template>


<script>
    export default {
        data() {
            return {
                //查询对象参数
                queryInfo: {
                    query: '',
                    pagenum: 1,
                    pagesize: 10
                },
                //商品列表
                goodslist: [],
                //总商品数
                total: 0,
            }
        },
        created() {
            this.getGoodsList()
        },
        methods: {
            //根据分页获取对应的商品列表
            async getGoodsList() {
                const { data: res } = await this.$http.get(`goods`, { params: this.queryInfo })

                if (res.meta.status !== 200) {
                    return this.$message.error('Fail to get goods list')
                }
                this.$message.success('Get goods list succeed')
                console.log(res.data)
                this.goodslist = res.data.goods
                this.total = res.data.total
            },
            handleSizeChange(newSize) {
                this.queryInfo.pagesize = newSize
                this.getGoodsList()
            },
            handleCurrentChange(newPage) {
                this.queryInfo.pagenum = newPage
                this.getGoodsList()
            },
            async removeById(id) {
                const confirmResult = await this.$confirm('Delete?', 'Prompt', {
                    confirmButtonText: 'Confirm',
                    cancelButtonText: 'Cancel',
                    type: 'warning'
                }).catch(err => err)

                if (confirmResult !== 'confirm') {
                    return this.$message.info('Cancel delete')
                }

                const { data: res } = await this.$http.delete(`goods/${id}`)

                if (res.meta.status !== 200) {
                    return this.$message.error('Fail to delete')
                }
                this.$message.success('Delete succeed')
                this.getGoodsList()
            },
            goAddPage(){
                this.$router.push(`/goods/add`)
            },
        }
    }
</script>


<style lang="less" scoped>

</style>